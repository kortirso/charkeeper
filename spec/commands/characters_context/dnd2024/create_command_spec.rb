# frozen_string_literal: true

describe CharactersContext::Dnd2024::CreateCommand do
  subject(:command_call) { instance.call(params) }

  let(:instance) { described_class.new }
  let(:user) { create :user }
  let(:valid_params) do
    {
      user: user, name: 'Char', alignment: 'neutral', main_class: 'bard', species: 'human', size: 'medium'
    }
  end

  context 'for valid params' do
    let(:params) { valid_params }

    it 'creates character and successfuly serialize', :aggregate_failures do
      expect { command_call }.to change(user.characters, :count).by(1)

      json = Panko::Response.create do |response|
        { 'character' => response.serializer(command_call[:result], Dnd2024::CharacterSerializer) }
      end
      expect { JSON.parse(json.to_json) }.not_to raise_error
    end
  end

  context 'for invalid params' do
    context 'without heritages' do
      let(:params) { valid_params.merge(species: nil).compact }

      it 'does not create character', :aggregate_failures do
        expect { command_call }.not_to change(user.characters, :count)
        expect(command_call[:errors]).not_to be_nil
      end
    end
  end
end
