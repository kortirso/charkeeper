# frozen_string_literal: true

describe CharactersContext::Dnd5::UpdateCommand do
  subject(:command_call) { instance.call(params) }

  let(:instance) { described_class.new }
  let!(:character) { create :character }
  let(:valid_params) do
    {
      character: Dnd5::Character.find(character.id), classes: { 'monk' => 4, 'druid' => 1 }
    }
  end

  before do
    create :spell, available_for: ['druid']
    create :spell, available_for: ['wizard']
  end

  context 'for valid params' do
    let(:params) { valid_params }

    it 'updates character and successfuly serialize', :aggregate_failures do
      expect { command_call }.to change(Character::Spell, :count).by(1)

      json = Panko::Response.create do |response|
        { 'character' => response.serializer(command_call[:result], Dnd5::CharacterSerializer) }
      end
      expect { JSON.parse(json.to_json) }.not_to raise_error

      expect {
        instance.call({ character: Dnd5::Character.find(character.id), classes: { 'monk' => 4 } })
      }.to change(Character::Spell, :count).by(-1)
    end
  end
end
