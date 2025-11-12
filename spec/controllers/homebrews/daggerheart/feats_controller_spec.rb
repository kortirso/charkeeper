# frozen_string_literal: true

describe Homebrews::Daggerheart::FeatsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      context 'for Daggerheart' do
        let(:request) { get :index, params: { provider: 'daggerheart', charkeeper_access_token: access_token } }
        let!(:feat1) { create :feat, :rally, user: user_session.user }

        before { create :feat, :rally }

        it 'returns data', :aggregate_failures do
          request

          expect(response).to have_http_status :ok
          expect(response.parsed_body['feats'].size).to eq 1
          expect(response.parsed_body['feats'].pluck('id')).to contain_exactly(feat1.id)
        end
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      let!(:origin) { create :homebrew_race, :daggerheart, user: user_session.user }
      let(:valid_params) { { title: 'Title', description: 'Descr', origin: 'ancestry', origin_value: origin.id, kind: 'static' } }
      let(:request) {
        post :create, params: {
          brewery: params,
          provider: 'daggerheart',
          charkeeper_access_token: access_token
        }
      }

      context 'for invalid params' do
        let(:params) { valid_params.merge(title: '') }

        it 'does not create feat', :aggregate_failures do
          expect { request }.not_to change(Feat, :count)
          expect(response).to have_http_status :unprocessable_content
        end
      end

      context 'for valid params' do
        let(:params) { valid_params }

        it 'creates feat', :aggregate_failures do
          expect { request }.to change(user_session.user.feats, :count).by(1)
          expect(response).to have_http_status :created
        end
      end
    end
  end

  describe 'DELETE#destroy' do
    context 'for logged users' do
      let!(:feat) { create :feat, :rally }

      context 'for unexisting feat' do
        it 'returns error' do
          delete :destroy, params: { id: 'unexisting', provider: 'daggerheart', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user feat' do
        it 'returns error' do
          delete :destroy, params: { id: feat.id, provider: 'daggerheart', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user feat' do
        let(:request) {
          delete :destroy, params: { id: feat.id, provider: 'daggerheart', charkeeper_access_token: access_token }
        }

        before { feat.update!(user: user_session.user) }

        it 'deletes feat', :aggregate_failures do
          expect { request }.to change(Feat, :count).by(-1)
          expect(response).to have_http_status :ok
          expect(response.parsed_body).to eq({ 'result' => 'ok' })
        end
      end
    end
  end
end
