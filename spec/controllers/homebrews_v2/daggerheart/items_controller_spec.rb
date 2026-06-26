# frozen_string_literal: true

describe HomebrewsV2::Daggerheart::ItemsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  before do
    create :item, :daggerheart, user: user_session.user, kind: 'item'
    create :item, :daggerheart, public: true, kind: 'item'
    create :item, :daggerheart, kind: 'item'
    create :item, :daggerheart, public: true, kind: 'recipe'
    create :item, :daggerheart, kind: 'armor'
  end

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
end
