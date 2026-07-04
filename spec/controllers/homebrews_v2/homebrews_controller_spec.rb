# frozen_string_literal: true

describe HomebrewsV2::HomebrewsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  let!(:homebrew1) { create :homebrew, :daggerheart_ancestry, user: user_session.user }
  let!(:homebrew2) { create :homebrew, :daggerheart_ancestry }
  let!(:homebrew3) { create :homebrew, :daggerheart_ancestry, public: true }

  describe 'GET#index' do
    context 'for logged users' do
      let(:request) { get :index, params: { type: 'Daggerheart::Homebrews::Ancestry', charkeeper_access_token: access_token } }

      it 'returns data', :aggregate_failures do
        request

        expect(response).to have_http_status :ok
        expect(response.parsed_body['homebrews'].size).to eq 2
        expect(response.parsed_body.dig('homebrews', 0).keys).to(
          contain_exactly('id', 'title', 'description', 'own', 'books')
        )
      end
    end
  end

  describe 'POST#batch_destroy' do
    context 'for logged users' do
      let(:request) {
        post :batch_destroy, params: {
          type: 'Daggerheart::Homebrews::Ancestry',
          ids: [homebrew1.id, homebrew2.id, homebrew3.id],
          charkeeper_access_token: access_token
        }
      }

      it 'returns data', :aggregate_failures do
        expect { request }.to change(Daggerheart::Homebrews::Ancestry.kept, :count).by(-1)
        expect(Daggerheart::Homebrews::Ancestry.count).to eq 3
        expect(response).to have_http_status :ok
      end
    end
  end
end
