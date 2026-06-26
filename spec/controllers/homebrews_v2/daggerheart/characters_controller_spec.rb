# frozen_string_literal: true

describe HomebrewsV2::Daggerheart::CharactersController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:character) { create :character, :daggerheart, user: user_session.user }

  describe 'GET#index' do
    context 'for logged users' do
      let(:request) { get :index, params: { charkeeper_access_token: access_token } }

      it 'returns data', :aggregate_failures do
        request

        expect(response).to have_http_status :ok
        expect(response.parsed_body['homebrews'].size).to eq 1
        expect(response.parsed_body.dig('homebrews', 0).keys).to contain_exactly('id', 'title', 'own')
      end
    end
  end

  describe 'GET#show' do
    context 'for logged users' do
      context 'for unexisting character' do
        let(:request) { get :show, params: { id: 'unexisting', charkeeper_access_token: access_token } }

        it 'returns error' do
          request

          expect(response).to have_http_status :not_found
        end
      end

      context 'for existing character' do
        let(:request) { get :show, params: { id: character.id, charkeeper_access_token: access_token } }

        it 'returns data', :aggregate_failures do
          request

          expect(response).to have_http_status :ok
          expect(response.parsed_body['homebrew'].keys).to contain_exactly('id', 'title', 'own', 'features')
        end
      end
    end
  end
end
