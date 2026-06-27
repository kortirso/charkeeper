# frozen_string_literal: true

describe HomebrewsV2::Dnd2024::FeatsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      let(:request) { get :index, params: { charkeeper_access_token: access_token } }

      before do
        create :dnd2024_feat, user: user_session.user
        create :dnd2024_feat, public: true
        create :dnd2024_feat
      end

      it 'returns data', :aggregate_failures do
        request

        expect(response).to have_http_status :ok
        expect(response.parsed_body['homebrews'].size).to eq 2
        expect(response.parsed_body.dig('homebrews', 0).keys).to contain_exactly('id', 'title', 'own')
      end
    end
  end

  describe 'GET#show' do
    context 'for logged users' do
      let!(:feat) { create :dnd2024_feat, user: user_session.user }
      let(:request) { get :show, params: { id: feat.id, charkeeper_access_token: access_token } }

      it 'returns data', :aggregate_failures do
        request

        expect(response).to have_http_status :ok
        expect(response.parsed_body['homebrew'].keys).to contain_exactly('id', 'title', 'description', 'own')
      end
    end
  end

  describe 'POST#copy' do
    context 'for logged users' do
      let!(:feat) { create :dnd2024_feat, public: true }
      let(:request) { post :copy, params: { id: feat.id, charkeeper_access_token: access_token } }

      it 'returns data', :aggregate_failures do
        expect { request }.to change(Dnd2024::Feat, :count).by(1)
        expect(response).to have_http_status :created
        expect(response.parsed_body['homebrew'].keys).to contain_exactly('id', 'title', 'own')
      end
    end
  end
end
