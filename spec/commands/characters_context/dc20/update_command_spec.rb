# frozen_string_literal: true

describe CharactersContext::Dc20::UpdateCommand do
  subject(:command_call) { instance.call(params) }

  let(:instance) { described_class.new }
  let!(:character) { create :character, :dc20 }
  let(:valid_params) do
    {
      character: Dc20::Character.find(character.id), level: 2
    }
  end

  context 'for valid params' do
    let(:params) { valid_params }

    it 'updates character and successfully serialize', :aggregate_failures do
      command_call

      json = Panko::Response.create do |response|
        { 'character' => response.serializer(command_call[:result], Dc20::CharacterSerializer) }
      end
      expect { JSON.parse(json.to_json) }.not_to raise_error
      expect(character.reload.data.level).to eq 2
    end
  end
end
