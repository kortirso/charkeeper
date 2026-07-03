# frozen_string_literal: true

describe CharactersContext::Items::UpdateCommand do
  subject(:command_call) { instance.call(params.merge({ character_item: character_item })) }

  let(:instance) { described_class.new }
  let!(:character) { create :character }
  let!(:weapon1) { create :item, kind: 'weapon' }
  let!(:weapon2) { create :item, kind: 'weapon' }
  let!(:armor1) { create :item, kind: 'armor' }
  let!(:armor2) { create :item, kind: 'armor' }
  let!(:character_weapon2) {
    create :character_item,
           character: character,
           item: weapon2,
           state: 'backpack',
           states: Character::Item.default_states.merge(backpack: 1)
  }
  let!(:character_armor2) {
    create :character_item,
           character: character,
           item: armor2,
           state: 'backpack',
           states: Character::Item.default_states.merge(backpack: 3)
  }

  before do
    create :character_item, character: character, item: weapon1, state: 'hands'
  end

  context 'for weapon' do
    let(:character_item) { character_weapon2 }

    context 'when sends states' do
      let(:params) { { states: { hands: 2, backpack: 2, storage: nil }.stringify_keys } }

      it 'updates weapon', :aggregate_failures do
        command_call

        expect(character_weapon2.reload.state).to eq Character::Item::HANDS
        expect(character_weapon2.states).to eq({ 'hands' => 2, 'equipment' => 0, 'backpack' => 2, 'storage' => 0 })
      end
    end
  end

  context 'for armor' do
    let(:character_item) { character_armor2 }

    context 'when invalid amount' do
      let(:params) { { states: { hands: 2, backpack: 0, storage: nil }.stringify_keys } }

      it 'does not update armor' do
        expect(command_call[:errors_list]).not_to be_nil
      end
    end

    context 'when valid amount' do
      let(:params) { { states: { hands: 1, backpack: 0, storage: nil }.stringify_keys } }

      it 'updates armor', :aggregate_failures do
        expect(command_call[:errors_list]).to be_nil
        expect(character_armor2.reload.states).to eq({ 'hands' => 1, 'equipment' => 0, 'backpack' => 0, 'storage' => 0 })
      end

      context 'when armor exists' do
        before {
          create :character_item,
                 character: character,
                 item: armor1,
                 state: 'hands',
                 states: Character::Item.default_states.merge(equipment: 1)
        }

        it 'does not update armor' do
          expect(command_call[:errors_list]).not_to be_nil
        end
      end
    end
  end
end
