# frozen_string_literal: true

describe CharactersContext::Items::UpdateCommand do
  subject(:command_call) { instance.call(params.merge({ character_item: character_item })) }

  let(:instance) { described_class.new }
  let!(:character) { create :character }
  let!(:weapon1) { create :item, kind: 'weapon' }
  let!(:weapon2) { create :item, kind: 'weapon' }
  let!(:armor1) { create :item, kind: 'armor' }
  let!(:armor2) { create :item, kind: 'armor' }
  let!(:character_weapon2) { create :character_item, character: character, item: weapon2, state: 'backpack', quantity: 1 }
  let!(:character_armor2) { create :character_item, character: character, item: armor2, state: 'backpack' }
  let(:params) { { ready_to_use: ready_to_use } }

  before do
    create :character_item, character: character, item: weapon1, state: 'hands'
    create :character_item, character: character, item: armor1, state: 'equipment'
  end

  context 'for weapon' do
    let(:character_item) { character_weapon2 }
    let(:ready_to_use) { true }

    it 'updates weapon' do
      command_call

      expect(character_weapon2.reload.ready_to_use).to be_truthy
    end

    context 'when sends states' do
      let(:params) { { states: { hands: 2, backpack: 2 }.stringify_keys } }

      it 'updates weapon', :aggregate_failures do
        command_call

        expect(character_weapon2.state).to eq Character::Item::HANDS
        expect(character_weapon2.quantity).to eq 4
      end
    end

    context 'when sends state' do
      let(:params) { { state: 'hands' } }

      it 'updates weapon', :aggregate_failures do
        command_call

        expect(character_weapon2.state).to eq Character::Item::HANDS
        expect(character_weapon2.quantity).to eq 1
        expect(character_weapon2.states).to eq({ 'hands' => 1, 'equipment' => 0, 'backpack' => 0, 'storage' => 0 })
      end
    end
  end

  context 'for armor' do
    let(:character_item) { character_armor2 }
    let(:ready_to_use) { true }

    it 'does not update armor', :aggregate_failures do
      expect(command_call[:errors_list]).not_to be_nil
      expect(character_armor2.reload.ready_to_use).to be_falsy
    end
  end
end
