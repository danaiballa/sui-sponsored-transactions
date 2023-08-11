module dummy::dummy_nft{
  use sui::object::{Self, UID, ID};
  use sui::transfer;
  use sui::tx_context::{Self, TxContext};

  const EIDMismatch: u64 = 0;

  struct DummyNFT has key, store {
    id: UID,
    counter: u64,
  }

  struct MintCap has key, store{
    id: UID,
  }

  struct UpdateTicket has key, store {
    id: UID,
    dummy_nft_id: ID,
    new_counter: u64,
  }

  fun init(ctx: &mut TxContext){

    let mint_cap = MintCap{
      id: object::new(ctx)
    };

    transfer::transfer(mint_cap, tx_context::sender(ctx))
  }

  /// mint a dummyNFT. Anyone can mint it.
  public fun mint(_: &MintCap, counter: u64, ctx: &mut TxContext): DummyNFT{

    DummyNFT { id: object::new(ctx), counter}
    
  }

  public fun create_update_ticket(_: &MintCap, dummy_nft_id: ID, new_counter: u64, ctx: &mut TxContext): UpdateTicket {

    UpdateTicket { id: object::new(ctx), dummy_nft_id, new_counter}

  }

  /// update a DummyNFT using an UpdateTicket and burn UpdateTicket
  public fun update(dummy_nft: &mut DummyNFT, update_ticket: UpdateTicket){

    assert!(update_ticket.dummy_nft_id == object::uid_to_inner(&dummy_nft.id), EIDMismatch);

    let UpdateTicket { id, dummy_nft_id: _, new_counter} = update_ticket;

    dummy_nft.counter = new_counter;
    object::delete(id)

  }

  public fun id(dummy_nft: &DummyNFT): ID {
    object::uid_to_inner(&dummy_nft.id)
  }

  public fun counter(dummy_nft: &DummyNFT): u64 {
    dummy_nft.counter
  }
  
  #[test_only]
  public fun init_for_testing(ctx: &mut TxContext){
    init(ctx);
  }
  
}