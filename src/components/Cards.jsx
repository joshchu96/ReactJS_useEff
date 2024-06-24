import { useState, useEffect } from "react";
import axios from "axios";

function Cards() {
  const [deck, setDeck] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [card, setCard] = useState(null);
  const [remaining, setRemaining] = useState(52);

  useEffect(() => {
    const controller = new AbortController();
    const fetchDeck = async () => {
      try {
        const getDeck = await axios.get(
          "https://deckofcardsapi.com/api/deck/new/",
          {
            signal: controller.signal,
          }
        );
        setDeck(getDeck.data);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Fetch aborted");
        } else {
          console.error("Problem getting new deck", error);
        }
      }
    };
    fetchDeck();

    return () => controller.abort();
  }, []);

  const drawCard = (e) => {
    e.preventDefault();
    setIsDrawing(true);
  };

  const shuffleDeck = async (e) => {
    e.preventDefault();
    setIsShuffling(true);
    setCard(null);
    const controller = new AbortController();
    try {
      const response = await axios.get(
        `https://deckofcardsapi.com/api/deck/${deck.deck_id}/shuffle/`,
        { signal: controller.signal }
      );
      setDeck((prevDeck) => ({
        ...prevDeck,
        remaining: 52,
      }));
      setRemaining(52);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Shuffle aborted");
      } else {
        console.error("Failed to shuffle deck", error);
      }
    } finally {
      setIsShuffling(false);
    }
  };

  useEffect(() => {
    if (!isDrawing || !deck) return;

    const controller = new AbortController();
    const fetchCard = async () => {
      try {
        const response = await axios.get(
          `https://deckofcardsapi.com/api/deck/${deck.deck_id}/draw/?count=1`,
          { signal: controller.signal }
        );
        const card_info = response.data.cards[0];
        setCard(card_info);
        setRemaining((prevRemaining) => prevRemaining - 1);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Fetch aborted");
        } else {
          console.error("Failed to draw card", error);
        }
      } finally {
        setIsDrawing(false);
      }
    };
    fetchCard();

    return () => controller.abort();
  }, [isDrawing, deck]);

  return (
    <>
      {deck ? <p>Deck Id: {deck.deck_id}</p> : <p>Loading Deck...</p>}
      {card ? (
        <>
          <p>Suit: {card.suit}</p>
          <p>Value: {card.value}</p>
          <p>Cards Remaining: {remaining}</p>
        </>
      ) : (
        <p>Draw a card to see its value and suit.</p>
      )}
      <button onClick={drawCard} disabled={isDrawing || isShuffling}>
        Draw Card
      </button>
      <button onClick={shuffleDeck} disabled={isShuffling}>
        {isShuffling ? "Shuffling..." : "Shuffle Deck"}
      </button>
    </>
  );
}

export default Cards;
