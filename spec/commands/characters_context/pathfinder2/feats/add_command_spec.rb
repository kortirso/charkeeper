# frozen_string_literal: true

describe CharactersContext::Pathfinder2::Feats::AddCommand do
  subject(:command_call) { instance.call(params) }

  let(:instance) { described_class.new }
  let!(:character) { create :character, :pathfinder2 }
  let!(:feat) { create :feat, :rally, type: 'Pathfinder2::Feat' }
  let(:valid_params) do
    {
      character: Pathfinder2::Character.find(character.id),
      id: feat.id,
      type: 'ancestry',
      level: 1
    }
  end

  context 'for valid params' do
    let(:params) { valid_params }

    it 'adds feat', :aggregate_failures do
      expect { command_call }.to change(Character::Feat, :count).by(1)
      expect(character.reload.data.selected_feats).to eq(
        { feat.id => [{ 'type' => 'ancestry', 'level' => 1 }] }
      )
    end
  end
end
