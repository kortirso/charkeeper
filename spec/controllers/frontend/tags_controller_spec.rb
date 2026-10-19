# frozen_string_literal: true

describe Frontend::TagsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#show' do
    context 'for logged users' do
      context 'for unexisting tag' do
        it 'returns error', :aggregate_failures do
          get :show, params: { provider: 'pathfinder', type: 'general', id: 'missing', charkeeper_access_token: access_token }

          expect(response).to have_http_status :ok
          expect(response.parsed_body['value']).to eq 'Missing'
        end
      end

      context 'for existing tag' do
        it 'returns error', :aggregate_failures do
          get :show, params: { provider: 'pathfinder', type: 'general', id: 'acid', charkeeper_access_token: access_token }

          expect(response).to have_http_status :ok
          expect(response.parsed_body['value']).to eq 'Кислота'
        end
      end
    end
  end
end
