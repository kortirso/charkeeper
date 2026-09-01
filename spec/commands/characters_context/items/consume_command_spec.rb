# frozen_string_literal: true

describe CharactersContext::Items::ConsumeCommand do
  subject(:command_call) { instance.call(params) }

  let(:instance) { described_class.new }

  context 'for pathfinder' do
    let!(:character) { create :pathfinder2_character }
    let!(:potion) { create :item, info: { consume: [{ attribute: 'health_current', formula: '2 * D(8) + 5' }] } }
    let!(:character_item) do
      create :character_item, character: character, item: potion, states: {
        'hands' => 0, 'equipment' => 2, 'backpack' => 0, 'storage' => 0
      }
    end
    let(:params) {
      { character: Pathfinder2::Character.find(character.id), character_item: character_item, from_state: 'equipment' }
    }

    before do
      character.data['health_current'] = 1
      character.save
    end

    it 'restores health', :aggregate_failures do
      command_call

      expect(character_item.reload.states['equipment']).to eq 1
      expect(Character::Item.find_by(id: character_item.id)).not_to be_nil
      expect(character.reload.data.health_current >= 8).to be_truthy
    end

    context 'when many consumes' do
      it 'restores health', :aggregate_failures do
        instance.call(params)
        instance.call(params)

        expect(Character::Item.find_by(id: character_item.id)).to be_nil
        expect(character.reload.data.health_current >= 15).to be_truthy
      end
    end
  end

  context 'for dnd' do
    let!(:character) { create :dnd2024_character }
    let!(:potion) { create :item, info: { consume: [{ attribute: 'health', formula: '2 * D(8) + 5' }] } }
    let!(:character_item) do
      create :character_item, character: character, item: potion, states: {
        'hands' => 0, 'equipment' => 2, 'backpack' => 0, 'storage' => 0
      }
    end
    let(:params) {
      { character: Dnd2024::Character.find(character.id), character_item: character_item, from_state: 'equipment' }
    }

    it 'restores health', :aggregate_failures do
      command_call

      expect(character_item.reload.states['equipment']).to eq 1
      expect(Character::Item.find_by(id: character_item.id)).not_to be_nil
      expect(character.reload.data.health['current']).to eq 7
    end

    context 'when many consumes' do
      it 'restores health', :aggregate_failures do
        instance.call(params)
        instance.call(params)

        expect(Character::Item.find_by(id: character_item.id)).to be_nil
        expect(character.reload.data.health['current']).to eq 7
      end
    end
  end
end
