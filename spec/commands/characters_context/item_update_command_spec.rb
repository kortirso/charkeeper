# frozen_string_literal: true

describe CharactersContext::ItemUpdateCommand do
  subject(:command_call) { instance.call({ character_item: character_item, ready_to_use: ready_to_use }) }

  let(:instance) { described_class.new }
  let!(:character) { create :character }
  let!(:weapon1) { create :item, kind: 'weapon' }
  let!(:weapon2) { create :item, kind: 'weapon' }
  let!(:armor1) { create :item, kind: 'armor' }
  let!(:armor2) { create :item, kind: 'armor' }
  let!(:character_weapon2) { create :character_item, character: character, item: weapon2, ready_to_use: false }
  let!(:character_armor2) { create :character_item, character: character, item: armor2, ready_to_use: false }

  before do
    create :character_item, character: character, item: weapon1, ready_to_use: true
    create :character_item, character: character, item: armor1, ready_to_use: true
  end

  context 'for weapon' do
    let(:character_item) { character_weapon2 }
    let(:ready_to_use) { true }

    it 'updates weapon' do
      command_call

      expect(character_weapon2.reload.ready_to_use).to be_truthy
    end
  end

  context 'for armor' do
    let(:character_item) { character_armor2 }
    let(:ready_to_use) { true }

    it 'does not update armor', :aggregate_failures do
      expect(command_call[:errors]).not_to be_nil
      expect(character_armor2.reload.ready_to_use).to be_falsy
    end
  end
end
