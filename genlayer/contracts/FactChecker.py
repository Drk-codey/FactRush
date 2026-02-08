# genlayer/contracts/FactVerificator.py

"""
FactRush - Intelligent Contract for GenLayer
Version: 2.0

This contract implements:
- Multi-validator consensus (Optimistic Democracy)
- Web search integration for fact verification
- Dispute resolution with expanded validator set
- Score tracking and leaderboards
"""

from genlayer import *
import json

class FactVerificator:
    """
    Intelligent Contract for verifying factual claims
    using multiple AI validators and web search
    """
    
    def __init__(self, game_id: str, category: str, difficulty: str):
        """
        Initialize a new game session
        
        Args:
            game_id: Unique identifier for this game
            category: Fact category (Tech News, Science, etc.)
            difficulty: Easy, Medium, or Hard
        """
        self.game_id = game_id
        self.category = category
        self.difficulty = difficulty
        self.claims = {}  # claim_id -> Claim object
        self.disputes = {}  # dispute_id -> Dispute object
        self.player_scores = {}  # player_id -> score
        self.validator_count = 3  # Initial consensus quorum
        self.expanded_validators = 5  # For disputes
        
    # ============================================
    # CLAIM SUBMISSION
    # ============================================
    
    def submit_claim(self, claim_id: str, player_id: str, content: str, source_url: str = ""):
        """
        Submit a new claim for verification
        
        Args:
            claim_id: Unique claim identifier
            player_id: Player who submitted the claim
            content: The factual claim text
            source_url: Optional source URL for verification
        """
        if claim_id in self.claims:
            raise Exception(f"Claim {claim_id} already exists")
        
        self.claims[claim_id] = {
            "id": claim_id,
            "player_id": player_id,
            "content": content,
            "source_url": source_url,
            "status": "PENDING",
            "votes": {"VERIFIED": 0, "FALSE": 0, "UNCERTAIN": 0},
            "reasoning": [],
            "sources": [],
            "timestamp": gl.block.timestamp
        }
        
        return {"success": True, "claim_id": claim_id}
    
    # ============================================
    # VERIFICATION (Optimistic Democracy)
    # ============================================
    
    @gl.public
    @gl.eq_function
    def verify_claim(self, claim_id: str) -> dict:
        """
        Verify a claim using AI validators with web search
        
        This function runs on multiple validators independently.
        Each validator:
        1. Searches the web for evidence
        2. Analyzes the claim
        3. Votes VERIFIED, FALSE, or UNCERTAIN
        
        Args:
            claim_id: Claim to verify
            
        Returns:
            Verification result with consensus
        """
        if claim_id not in self.claims:
            raise Exception(f"Claim {claim_id} not found")
        
        claim = self.claims[claim_id]
        
        # Build verification prompt
        prompt = f"""
You are a fact-checking validator in the category: {self.category}.

Claim to verify: "{claim['content']}"
Difficulty level: {self.difficulty}
Source provided: {claim['source_url'] if claim['source_url'] else 'None'}

Your task:
1. Search the web for credible sources about this claim
2. Analyze the evidence
3. Return your verdict as JSON

Required JSON format:
{{
    "verdict": "VERIFIED" | "FALSE" | "UNCERTAIN",
    "confidence": 0-100,
    "reasoning": "Brief explanation of your verdict",
    "sources": ["url1", "url2"]
}}

Rules:
- VERIFIED: Claim is factually accurate with strong evidence
- FALSE: Claim is factually incorrect or misleading
- UNCERTAIN: Insufficient evidence or context needed
- Be objective and evidence-based
- Consider source credibility
"""
        
        # Call LLM with web search capability
        # In GenLayer, this triggers the AI validator with internet access
        response = gl.exec_prompt(
            prompt=prompt,
            tools=["web_search"]  # Enable web search tool
        )
        
        # Parse AI response
        try:
            result = json.loads(response)
        except:
            # Fallback if JSON parsing fails
            result = {
                "verdict": "UNCERTAIN",
                "confidence": 50,
                "reasoning": "Unable to parse validator response",
                "sources": []
            }
        
        # Record this validator's vote
        verdict = result["verdict"].upper()
        if verdict not in ["VERIFIED", "FALSE", "UNCERTAIN"]:
            verdict = "UNCERTAIN"
        
        # Store vote (this happens on each validator)
        claim["votes"][verdict] += 1
        claim["reasoning"].append(result["reasoning"])
        claim["sources"].extend(result.get("sources", []))
        
        # Calculate consensus (after all validators vote)
        total_votes = sum(claim["votes"].values())
        
        if total_votes >= self.validator_count:
            # Determine final verdict
            max_votes = max(claim["votes"].values())
            
            if claim["votes"]["VERIFIED"] == max_votes:
                claim["status"] = "VERIFIED"
            elif claim["votes"]["FALSE"] == max_votes:
                claim["status"] = "FALSE"
            else:
                claim["status"] = "UNCERTAIN"
            
            # Calculate confidence
            claim["confidence"] = int((max_votes / total_votes) * 100)
        
        return {
            "claim_id": claim_id,
            "status": claim["status"],
            "votes": claim["votes"],
            "confidence": claim.get("confidence", 0),
            "reasoning": claim["reasoning"][0] if claim["reasoning"] else "",
            "sources": list(set(claim["sources"]))  # Remove duplicates
        }
    
    # ============================================
    # QUERY CLAIMS
    # ============================================
    
    @gl.public.view
    def get_claim(self, claim_id: str) -> dict:
        """Get claim details"""
        if claim_id not in self.claims:
            raise Exception(f"Claim {claim_id} not found")
        return self.claims[claim_id]
    
    @gl.public.view
    def get_all_claims(self) -> list:
        """Get all claims in this game"""
        return list(self.claims.values())
    
    # ============================================
    # DISPUTES (Expanded Consensus)
    # ============================================
    
    def submit_dispute(self, dispute_id: str, claim_id: str, player_id: str, reasoning: str):
        """
        Submit a dispute for a claim verification
        
        Args:
            dispute_id: Unique dispute identifier
            claim_id: Claim being disputed
            player_id: Player submitting dispute
            reasoning: Why the verdict is wrong
        """
        if claim_id not in self.claims:
            raise Exception(f"Claim {claim_id} not found")
        
        if dispute_id in self.disputes:
            raise Exception(f"Dispute {dispute_id} already exists")
        
        self.disputes[dispute_id] = {
            "id": dispute_id,
            "claim_id": claim_id,
            "player_id": player_id,
            "reasoning": reasoning,
            "status": "PENDING",
            "timestamp": gl.block.timestamp
        }
        
        # Mark claim as disputed
        self.claims[claim_id]["disputed"] = True
        
        return {"success": True, "dispute_id": dispute_id}
    
    @gl.public
    @gl.eq_function
    def resolve_dispute(self, dispute_id: str) -> dict:
        """
        Resolve dispute with EXPANDED validator set
        
        This re-evaluates the claim with MORE validators
        to reach a more certain consensus.
        
        Args:
            dispute_id: Dispute to resolve
            
        Returns:
            Final judgment after expanded consensus
        """
        if dispute_id not in self.disputes:
            raise Exception(f"Dispute {dispute_id} not found")
        
        dispute = self.disputes[dispute_id]
        claim_id = dispute["claim_id"]
        claim = self.claims[claim_id]
        
        # Run verification again with expanded validator set
        # In practice, GenLayer will use MORE validators for this call
        expanded_result = self.verify_claim(claim_id)
        
        # Update dispute status
        if expanded_result["confidence"] > 70:
            dispute["status"] = "RESOLVED"
            dispute["final_verdict"] = expanded_result["status"]
        else:
            dispute["status"] = "UNRESOLVED"
            dispute["final_verdict"] = "UNCERTAIN"
        
        return {
            "dispute_id": dispute_id,
            "status": dispute["status"],
            "final_verdict": dispute["final_verdict"],
            "confidence": expanded_result["confidence"]
        }
    
    # ============================================
    # SCORING
    # ============================================
    
    def update_score(self, player_id: str, points: int):
        """
        Update player score
        
        Args:
            player_id: Player to update
            points: Points to add (can be negative)
        """
        if player_id not in self.player_scores:
            self.player_scores[player_id] = 0
        
        self.player_scores[player_id] += points
        
        return {
            "player_id": player_id,
            "total_score": self.player_scores[player_id]
        }
    
    @gl.public.view
    def get_leaderboard(self) -> list:
        """
        Get current game leaderboard
        
        Returns:
            List of players sorted by score
        """
        leaderboard = [
            {"player_id": pid, "score": score}
            for pid, score in self.player_scores.items()
        ]
        
        # Sort by score descending
        leaderboard.sort(key=lambda x: x["score"], reverse=True)
        
        return leaderboard
    
    # ============================================
    # GAME STATE
    # ============================================
    
    @gl.public.view
    def get_game_stats(self) -> dict:
        """Get overall game statistics"""
        return {
            "game_id": self.game_id,
            "category": self.category,
            "difficulty": self.difficulty,
            "total_claims": len(self.claims),
            "verified": sum(1 for c in self.claims.values() if c["status"] == "VERIFIED"),
            "false": sum(1 for c in self.claims.values() if c["status"] == "FALSE"),
            "uncertain": sum(1 for c in self.claims.values() if c["status"] == "UNCERTAIN"),
            "disputed": sum(1 for c in self.claims.values() if c.get("disputed", False)),
            "players": len(self.player_scores)
        }