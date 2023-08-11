// test obv doesn't have full coverage, this is a demo
#[test_only]
module dummy::test_dummy{

  use sui::test_scenario::{Self, ctx};
  use sui::transfer;


  use dummy::dummy_nft::{Self, DummyNFT, MintCap, UpdateTicket};

  const ADMIN: address = @0x0;
  const USER: address = @0x1;

  const ENFTNotUpdatedProperly: u64 = 0;

  #[test]
  fun test_update(){

    let scenaro_val = test_scenario::begin(ADMIN);
    let scenario = &mut scenaro_val;

    dummy_nft::init_for_testing(ctx(scenario));

    // next transaction by admin to mint an dummy NFT and transfer it to a user
    test_scenario::next_tx(scenario, ADMIN);
    let mint_cap = test_scenario::take_from_address<MintCap>(scenario, ADMIN);
    let dummy_nft = dummy_nft::mint(&mint_cap, 3, ctx(scenario));
    // keep dummy nft id for later
    let dummy_nft_id = dummy_nft::id(&dummy_nft);
    transfer::public_transfer(dummy_nft, USER);
    test_scenario::return_to_address(ADMIN, mint_cap);

    // next transaction by admin to issue an update ticket for dummyNFT
    test_scenario::next_tx(scenario, ADMIN);
    let mint_cap = test_scenario::take_from_address<MintCap>(scenario, ADMIN);
    let update_ticket = dummy_nft::create_update_ticket(&mint_cap, dummy_nft_id, 5, ctx(scenario));
    transfer::public_transfer(update_ticket, USER);
    test_scenario::return_to_address(ADMIN, mint_cap);

    // next transaction by user to update dummyNFT
    test_scenario::next_tx(scenario, USER);
    let dummy_nft = test_scenario::take_from_address<DummyNFT>(scenario, USER);
    let update_ticket = test_scenario::take_from_address<UpdateTicket>(scenario, USER);
    dummy_nft::update(&mut dummy_nft, update_ticket);
    assert!(dummy_nft::counter(&dummy_nft) == 5, ENFTNotUpdatedProperly);
    test_scenario::return_to_address(USER, dummy_nft);

    test_scenario::end(scenaro_val);

  }
}