# frozen_string_literal: true

describe CharactersContext::Dnd5::CreateCommand do
  subject(:command_call) { instance.call(params) }

  let(:instance) { described_class.new }
  let!(:user) { create :user }
  let(:valid_params) do
    {
      user: user, name: 'Char', alignment: 'neutral', main_class: 'druid', race: 'human', size: 'medium'
    }
  end

  before do
    create :spell, available_for: ['druid']
    create :spell, available_for: ['wizard']
  end

  context 'for valid params' do
    let(:params) { valid_params }

    it 'creates character and successfuly serialize', :aggregate_failures do
      expect { command_call }.to(
        change(user.characters, :count).by(1)
          .and(change(Character::Spell, :count).by(1))
      )

      json = Panko::Response.create do |response|
        { 'character' => response.serializer(command_call[:result], Dnd5::CharacterSerializer) }
      end
      expect { JSON.parse(json.to_json) }.not_to raise_error
    end
  end

  context 'for invalid params' do
    context 'without race' do
      let(:params) { valid_params.merge(race: nil).compact }

      it 'does not create character', :aggregate_failures do
        expect { command_call }.not_to change(user.characters, :count)
        expect(command_call[:errors_list]).not_to be_nil
      end
    end
  end
end
