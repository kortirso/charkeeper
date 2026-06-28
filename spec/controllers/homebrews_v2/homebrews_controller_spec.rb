# frozen_string_literal: true

describe HomebrewsV2::HomebrewsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  before do
    create :homebrew, :daggerheart_ancestry, user: user_session.user
    create :homebrew, :daggerheart_ancestry
    create :homebrew, :daggerheart_ancestry, public: true
  end

  describe 'GET#index' do
    context 'for logged users' do
      let(:request) { get :index, params: { type: 'Daggerheart::Homebrews::Ancestry', charkeeper_access_token: access_token } }

      it 'returns data', :aggregate_failures do
        request

        expect(response).to have_http_status :ok
        expect(response.parsed_body['homebrews'].size).to eq 2
        expect(response.parsed_body.dig('homebrews', 0).keys).to contain_exactly('id', 'title', 'description', 'own')
      end
    end
  end
end
