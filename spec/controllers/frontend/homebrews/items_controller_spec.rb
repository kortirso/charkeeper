# frozen_string_literal: true

describe Frontend::Homebrews::ItemsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      context 'for Daggerheart' do
        let(:request) { get :index, params: { provider: 'daggerheart', charkeeper_access_token: access_token } }
        let!(:item1) { create :item, :daggerheart, user: user_session.user }

        before { create :item, :daggerheart }

        it 'returns data', :aggregate_failures do
          request

          expect(response).to have_http_status :ok
          expect(response.parsed_body['items'].size).to eq 1
          expect(response.parsed_body['items'].pluck('id')).to contain_exactly(item1.id)
        end
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      let(:valid_params) { { name: 'Name', kind: 'item' } }
      let(:request) {
        post :create, params: {
          brewery: params,
          provider: 'daggerheart',
          charkeeper_access_token: access_token
        }
      }

      context 'for invalid params' do
        let(:params) { valid_params.merge(name: '') }

        it 'does not create item', :aggregate_failures do
          expect { request }.not_to change(Item, :count)
          expect(response).to have_http_status :unprocessable_entity
        end
      end

      context 'for valid params' do
        let(:params) { valid_params }

        it 'creates item', :aggregate_failures do
          expect { request }.to change(user_session.user.items, :count).by(1)
          expect(response).to have_http_status :created
        end
      end
    end
  end

  describe 'DELETE#destroy' do
    context 'for logged users' do
      let!(:item) { create :item, :daggerheart }

      context 'for unexisting item' do
        it 'returns error' do
          delete :destroy, params: { id: 'unexisting', provider: 'daggerheart', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user item' do
        it 'returns error' do
          delete :destroy, params: { id: item.id, provider: 'daggerheart', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user item' do
        let(:request) {
          delete :destroy, params: { id: item.id, provider: 'daggerheart', charkeeper_access_token: access_token }
        }

        before { item.update!(user: user_session.user) }

        it 'deletes item', :aggregate_failures do
          expect { request }.to change(Item, :count).by(-1)
          expect(response).to have_http_status :ok
          expect(response.parsed_body).to eq({ 'result' => 'ok' })
        end
      end
    end
  end
end
