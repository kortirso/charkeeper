# frozen_string_literal: true

describe CharactersContext::Pathfinder2::CreateCommand do
  subject(:command_call) { instance.call(params) }

  let(:instance) { described_class.new }
  let(:user) { create :user }
  let(:valid_params) do
    {
      user: user,
      name: 'Char',
      main_class: 'witch',
      subclass: 'the_inscribed_one',
      race: 'halfling',
      subrace: 'twilight_halfling',
      background: 'hermit'
    }
  end

  context 'for valid params' do
    let(:params) { valid_params }

    it 'creates character and successfuly serialize', :aggregate_failures do
      expect { command_call }.to change(user.characters, :count).by(1)

      json = Panko::Response.create do |response|
        { 'character' => response.serializer(command_call[:result], Pathfinder2::CharacterSerializer) }
      end
      expect { JSON.parse(json.to_json) }.not_to raise_error
    end
  end

  context 'for invalid params' do
    context 'without race' do
      let(:params) { valid_params.merge(race: nil).compact }

      it 'does not create character', :aggregate_failures do
        expect { command_call }.not_to change(user.characters, :count)
        expect(command_call[:errors]).not_to be_nil
      end
    end
  end
end
