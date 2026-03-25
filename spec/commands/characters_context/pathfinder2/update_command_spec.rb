# frozen_string_literal: true

describe CharactersContext::Pathfinder2::UpdateCommand do
  subject(:command_call) { instance.call(params) }

  let(:instance) { described_class.new }
  let!(:character) { create :character, :pathfinder2 }
  let!(:feat) { create :feat, :pathfinder2 }
  let(:valid_params) do
    {
      character: Pathfinder2::Character.find(character.id),
      abilities: { str: 13, dex: 14, con: 10, wis: 12, int: 12, cha: 10 },
      coins: { gold: 1, silver: 2, copper: 3 },
      selected_features: { 'feat' => feat.slug }
    }
  end

  context 'for valid params' do
    let(:params) { valid_params }

    it 'updates character and successfully serialize', :aggregate_failures do
      expect { command_call }.to change(Character::Feat, :count).by(1)

      json = Panko::Response.create do |response|
        { 'character' => response.serializer(command_call[:result], Pathfinder2::CharacterSerializer) }
      end
      expect { JSON.parse(json.to_json) }.not_to raise_error
    end
  end
end
