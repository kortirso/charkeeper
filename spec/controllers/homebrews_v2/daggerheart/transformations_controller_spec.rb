# frozen_string_literal: true

describe HomebrewsV2::Daggerheart::TransformationsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:own_transformation) { create :homebrew, :daggerheart_transformation, user: user_session.user }
  let!(:transformation) { create :homebrew, :daggerheart_transformation }

  describe 'GET#show' do
    context 'for logged users' do
      context 'for unexisting homebrew' do
        let(:request) { get :show, params: { id: 'unexisting', charkeeper_access_token: access_token } }

        it 'returns error' do
          request

          expect(response).to have_http_status :not_found
        end
      end

      context 'for existing homebrew' do
        let(:request) { get :show, params: { id: transformation.id, charkeeper_access_token: access_token } }

        it 'returns data', :aggregate_failures do
          request

          expect(response).to have_http_status :ok
          expect(response.parsed_body['homebrew'].keys).to contain_exactly('id', 'features')
        end
      end
    end
  end

  describe 'DELETE#destroy' do
    context 'for logged users' do
      context 'for unexisting homebrew' do
        let(:request) { delete :destroy, params: { id: 'unexisting', charkeeper_access_token: access_token } }

        it 'returns error' do
          request

          expect(response).to have_http_status :not_found
        end
      end

      context 'for unavailable homebrew' do
        let(:request) { delete :destroy, params: { id: transformation.id, charkeeper_access_token: access_token } }

        it 'returns error' do
          request

          expect(response).to have_http_status :not_found
        end
      end

      context 'for existing homebrew without using for character' do
        let(:request) { delete :destroy, params: { id: own_transformation.id, charkeeper_access_token: access_token } }

        it 'destroys homebrew', :aggregate_failures do
          expect { request }.to change(Homebrew, :count).by(-1)
          expect(response).to have_http_status :ok
        end
      end

      context 'for existing homebrew with using for character' do
        let(:request) { delete :destroy, params: { id: own_transformation.id, charkeeper_access_token: access_token } }

        before do
          character = create :character, :daggerheart
          character.data['transformation'] = own_transformation.id
          character.save
        end

        it 'discards homebrew', :aggregate_failures do
          expect { request }.to change(Homebrew.kept, :count).by(-1)
          expect(response).to have_http_status :ok
        end
      end
    end
  end
end
