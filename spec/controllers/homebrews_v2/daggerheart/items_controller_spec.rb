# frozen_string_literal: true

describe HomebrewsV2::Daggerheart::ItemsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  let!(:item1) { create :item, :daggerheart, user: user_session.user, kind: 'item' }
  let!(:item2) { create :item, :daggerheart, public: true, kind: 'item' }
  let!(:item3) { create :item, :daggerheart, kind: 'item' }
  let!(:item4) { create :item, :daggerheart, public: true, kind: 'recipe' }
  let!(:item5) { create :item, :daggerheart, kind: 'armor' }

  describe 'GET#index' do
    context 'for logged users' do
      let(:request) { get :index, params: { charkeeper_access_token: access_token, type: 'item,recipe' } }

      it 'returns data', :aggregate_failures do
        request

        expect(response).to have_http_status :ok
        expect(response.parsed_body['homebrews'].size).to eq 3
        expect(response.parsed_body.dig('homebrews', 0).keys).to contain_exactly('id', 'title', 'description', 'own')
      end
    end
  end

  describe 'GET#show' do
    context 'for logged users' do
      let(:request) { get :show, params: { id: item1.id, charkeeper_access_token: access_token } }

      it 'returns data', :aggregate_failures do
        request

        expect(response).to have_http_status :ok
        expect(response.parsed_body['homebrew'].keys).to(
          contain_exactly('id', 'info', 'kind', 'recipes')
        )
      end
    end
  end

  describe 'POST#batch_destroy' do
    context 'for logged users' do
      let(:request) {
        post :batch_destroy, params: {
          ids: [item1.id, item2.id, item3.id, item4.id, item5.id],
          charkeeper_access_token: access_token
        }
      }

      it 'returns data', :aggregate_failures do
        expect { request }.to change(Daggerheart::Item.kept, :count).by(-1)
        expect(Daggerheart::Item.count).to eq 5
        expect(response).to have_http_status :ok
      end
    end
  end
end
