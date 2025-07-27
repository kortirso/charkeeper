# frozen_string_literal: true

describe HomebrewContext::Daggerheart::AddFeatCommand do
  subject(:command_call) { instance.call(params) }

  let(:instance) { described_class.new }
  let!(:user) { create :user }
  let!(:origin) { create :homebrew_race, :daggerheart, user: user }
  let!(:another_origin) { create :homebrew_race, :daggerheart }
  let(:valid_params) do
    { user: user, title: 'Title', description: 'Descr', origin: 'ancestry', origin_value: origin.id, kind: 'static' }
  end

  context 'for invalid params' do
    context 'for invalid title' do
      let(:params) { valid_params.merge(title: '') }

      it 'does not create feat', :aggregate_failures do
        expect { command_call }.not_to change(Feat, :count)
        expect(command_call[:errors]).to eq({ title: ["Title can't be blank"] })
      end
    end

    context 'for long title' do
      let(:params) { valid_params.merge(title: 'a' * 51) }

      it 'does not create feat', :aggregate_failures do
        expect { command_call }.not_to change(Feat, :count)
        expect(command_call[:errors]).to eq({ title: ["Title's size cannot be greater than 50"] })
      end
    end

    context 'for invalid origin' do
      let(:params) { valid_params.merge(origin: 'unexisting') }

      it 'does not create feat', :aggregate_failures do
        expect { command_call }.not_to change(Feat, :count)
        expect(command_call[:errors]).to eq({ origin: ['Unknown value of origin'] })
      end
    end

    context 'for not existing origin value' do
      let(:params) { valid_params.merge(origin_value: another_origin.id) }

      it 'does not create feat', :aggregate_failures do
        expect { command_call }.not_to change(Feat, :count)
        expect(command_call[:errors]).to eq({ origin: ['Origin is not found'] })
      end
    end

    context 'without limit' do
      let(:params) { valid_params.merge(limit_refresh: 'short_rest') }

      it 'does not create feat', :aggregate_failures do
        expect { command_call }.not_to change(Feat, :count)
        expect(command_call[:errors]).to eq({ limit: ["Limit can't be blank"] })
      end
    end
  end

  context 'for valid params' do
    let(:params) { valid_params }

    it 'creates feat', :aggregate_failures do
      expect { command_call }.to change(user.feats, :count).by(1)
      expect(command_call[:errors]).to be_nil
    end
  end
end
