# frozen_string_literal: true

describe Homebrews::Dnd::SpellsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      let(:request) { get :index, params: { provider: 'dnd', charkeeper_access_token: access_token } }
      let!(:spell) { create :feat, :dnd2024, user: user_session.user, origin: 6 }

      before { create :feat, :dnd2024, origin: 6 }

      it 'returns data', :aggregate_failures do
        request

        expect(response).to have_http_status :ok
        expect(response.parsed_body['spells'].size).to eq 1
        expect(response.parsed_body['spells'].pluck('id')).to contain_exactly(spell.id)
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      let(:valid_params) {
        {
          title: 'Title', description: 'Descr', origin_values: ['bard'], info: {
            level: 0, school: 'necromancy', time: '1,m', range: '60,ft', components: 'v', duration: 'instant',
            effects: []
          }
        }
      }
      let(:request) {
        post :create, params: {
          brewery: params,
          provider: 'dnd',
          charkeeper_access_token: access_token
        }
      }

      context 'for invalid params' do
        let(:params) { valid_params.merge(title: '') }

        it 'does not create spell', :aggregate_failures do
          expect { request }.not_to change(Dnd2024::Feat, :count)
          expect(response).to have_http_status :unprocessable_content
        end
      end

      context 'for valid params' do
        let(:params) { valid_params }

        it 'creates spell', :aggregate_failures do
          expect { request }.to change(user_session.user.feats, :count).by(1)
          expect(response).to have_http_status :created
        end
      end
    end
  end

  describe 'DELETE#destroy' do
    context 'for logged users' do
      let!(:spell) { create :feat, :dnd2024, origin: 6 }

      context 'for unexisting spell' do
        it 'returns error' do
          delete :destroy, params: { id: 'unexisting', provider: 'dnd', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user spell' do
        it 'returns error' do
          delete :destroy, params: { id: spell.id, provider: 'dnd', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user spell' do
        let(:request) {
          delete :destroy, params: { id: spell.id, provider: 'dnd', charkeeper_access_token: access_token }
        }

        before { spell.update!(user: user_session.user) }

        it 'deletes spell', :aggregate_failures do
          expect { request }.to change(Feat, :count).by(-1)
          expect(response).to have_http_status :ok
          expect(response.parsed_body).to eq({ 'result' => 'ok' })
        end
      end
    end
  end
end
