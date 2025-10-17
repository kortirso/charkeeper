# frozen_string_literal: true

describe Frontend::Users::IdentitiesController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'DELETE#destroy' do
    context 'for logged users' do
      context 'for unexisting user identity' do
        let!(:identity) { create :user_identity }
        let(:request) { delete :destroy, params: { id: identity.id, charkeeper_access_token: access_token } }

        it 'returns error', :aggregate_failures do
          expect { request }.not_to change(User::Identity, :count)
          expect(response).to have_http_status :not_found
        end
      end

      context 'for existing user identity' do
        let!(:identity) { create :user_identity, user: user_session.user }
        let(:request) { delete :destroy, params: { id: identity.id, charkeeper_access_token: access_token } }

        it 'removes identity', :aggregate_failures do
          expect { request }.to change(user_session.user.identities, :count).by(-1)
          expect(response).to have_http_status :ok
        end
      end
    end
  end
end
