# frozen_string_literal: true

describe CharactersContext::Dnd2024::UpdateCommand do
  subject(:command_call) { instance.call(params) }

  let(:instance) { described_class.new }
  let!(:character) { create :character, :dnd2024 }
  let(:valid_params) do
    {
      character: Dnd2024::Character.find(character.id), classes: { 'bard' => 5 }
    }
  end

  before do
    create :feat, :dnd2024_bardic_inspiration, conditions: { 'level' => 5 }, slug: 'advances_inspiration', origin: 1
  end

  context 'for valid params' do
    let(:params) { valid_params }

    it 'updates character and successfully serialize', :aggregate_failures do
      expect { command_call }.to change(Character::Feat, :count).by(1)

      json = Panko::Response.create do |response|
        { 'character' => response.serializer(command_call[:result], Dnd2024::CharacterSerializer) }
      end
      expect { JSON.parse(json.to_json) }.not_to raise_error

      expect {
        instance.call({ character: Dnd2024::Character.find(character.id), classes: { 'bard' => 4 } })
      }.to change(Character::Feat, :count).by(-1)
    end
  end
end
