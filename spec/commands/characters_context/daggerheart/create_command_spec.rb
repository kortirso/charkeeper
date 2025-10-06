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

    before { create :feat, :rally }

    it 'creates character and successfuly serialize', :aggregate_failures do
      expect { command_call }.to(
        change(user.characters, :count).by(1)
          .and(change(Character::Feat, :count).by(1))
      )

      json = Panko::Response.create do |response|
        { 'character' => response.serializer(command_call[:result], Daggerheart::CharacterSerializer) }
      end
      expect { JSON.parse(json.to_json) }.not_to raise_error
    end

    context 'for valid homebrew heritage' do
      let!(:heritage) { create :homebrew_race, :daggerheart, user: user }
      let(:valid_params) do
        {
          user: user, name: 'Char', community: 'highborne', main_class: 'bard', subclass: 'troubadour', heritage: heritage.id
        }
      end

      before { HomebrewsContext::RefreshUserDataService.new.call(user: user) }

      it 'creates character and successfuly serialize', :aggregate_failures do
        expect { command_call }.to change(user.characters, :count).by(1)

        json = Panko::Response.create do |response|
          { 'character' => response.serializer(command_call[:result], Daggerheart::CharacterSerializer) }
        end
        expect { JSON.parse(json.to_json) }.not_to raise_error
      end
    end

    context 'for valid homebrew class' do
      let!(:speciality) do
        create :homebrew_speciality, :daggerheart, user: user, data: { evasion: 12, health_max: 6, domains: %w[codex grace] }
      end
      let!(:subclass) { create :homebrew_subclass, :daggerheart, user: user }
      let(:valid_params) do
        {
          user: user, name: 'Char', community: 'highborne', main_class: speciality.id, subclass: subclass.id, heritage: 'clank'
        }
      end

      it 'creates character and successfuly serialize', :aggregate_failures do
        expect { command_call }.to change(user.characters, :count).by(1)

        character = command_call[:result]
        expect(character.data.evasion).to eq 12

        json = Panko::Response.create do |response|
          { 'character' => response.serializer(character, Daggerheart::CharacterSerializer) }
        end
        expect { JSON.parse(json.to_json) }.not_to raise_error
      end
    end
  end

  context 'for invalid params' do
    context 'without heritages' do
      let(:params) { valid_params.merge(heritage: nil).compact }

      it 'does not create character', :aggregate_failures do
        expect { command_call }.not_to change(user.characters, :count)
        expect(command_call[:errors_list]).not_to be_nil
      end
    end

    context 'for invalid homebrew heritage' do
      let!(:heritage) { create :homebrew_race, :daggerheart }
      let(:params) { valid_params.merge(heritage: heritage.id).compact }

      it 'does not create character', :aggregate_failures do
        expect { command_call }.not_to change(user.characters, :count)
        expect(command_call[:errors_list]).not_to be_nil
      end
    end

    context 'for empty subclass' do
      let(:params) { valid_params.merge(subclass: '') }

      it 'does not create character', :aggregate_failures do
        expect { command_call }.not_to change(user.characters, :count)
        expect(command_call[:errors_list]).not_to be_nil
      end
    end

    context 'for double heritage' do
      let(:params) { valid_params.merge(heritage_name: 'Name') }

      it 'does not create character', :aggregate_failures do
        expect { command_call }.not_to change(user.characters, :count)
        expect(command_call[:errors_list]).not_to be_nil
      end
    end

    context 'for empty heritage features' do
      let(:params) { valid_params.merge(heritage: nil, heritage_name: 'Name', heritage_features: [nil, nil]).compact }

      it 'does not create character', :aggregate_failures do
        expect { command_call }.not_to change(user.characters, :count)
        expect(command_call[:errors_list]).not_to be_nil
      end
    end
  end
end
