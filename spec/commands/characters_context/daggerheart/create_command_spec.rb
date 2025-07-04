# frozen_string_literal: true

describe CharactersContext::Daggerheart::CreateCommand do
  subject(:command_call) { instance.call(params) }

  let(:instance) { described_class.new }
  let(:user) { create :user }
  let(:valid_params) do
    {
      user: user, name: 'Char', community: 'highborne', main_class: 'bard', subclass: 'troubadour', heritage: 'clank'
    }
  end

  context 'for valid params' do
    let(:params) { valid_params }

    it 'creates character and successfuly serialize', :aggregate_failures do
      expect { command_call }.to change(user.characters, :count).by(1)

      json = Panko::Response.create do |response|
        { 'character' => response.serializer(command_call[:result], Daggerheart::CharacterSerializer) }
      end
      expect { JSON.parse(json.to_json) }.not_to raise_error
    end
  end

  context 'for invalid params' do
    context 'without heritages' do
      let(:params) { valid_params.merge(heritage: nil).compact }

      it 'does not create character', :aggregate_failures do
        expect { command_call }.not_to change(user.characters, :count)
        expect(command_call[:errors]).not_to be_nil
      end
    end

    context 'for empty subclass' do
      let(:params) { valid_params.merge(subclass: '') }

      it 'does not create character', :aggregate_failures do
        expect { command_call }.not_to change(user.characters, :count)
        expect(command_call[:errors]).not_to be_nil
      end
    end

    context 'for invalid subclass' do
      let(:params) { valid_params.merge(subclass: '1') }

      it 'does not create character', :aggregate_failures do
        expect { command_call }.not_to change(user.characters, :count)
        expect(command_call[:errors]).not_to be_nil
      end
    end

    context 'for double heritage' do
      let(:params) { valid_params.merge(heritage_name: 'Name') }

      it 'does not create character', :aggregate_failures do
        expect { command_call }.not_to change(user.characters, :count)
        expect(command_call[:errors]).not_to be_nil
      end
    end

    context 'for empty heritage features' do
      let(:params) { valid_params.merge(heritage: nil, heritage_name: 'Name', heritage_features: [nil, nil]).compact }

      it 'does not create character', :aggregate_failures do
        expect { command_call }.not_to change(user.characters, :count)
        expect(command_call[:errors]).not_to be_nil
      end
    end
  end
end
