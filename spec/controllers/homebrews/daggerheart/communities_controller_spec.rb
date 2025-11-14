# frozen_string_literal: true

describe Homebrews::Daggerheart::CommunitiesController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'DELETE#destroy' do
    context 'for logged users' do
      let!(:homebrew) { create :homebrew_community, :daggerheart }

      context 'for unexisting homebrew' do
        it 'returns error' do
          delete :destroy, params: { id: 'unexisting', provider: 'daggerheart', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user homebrew' do
        it 'returns error' do
          delete :destroy, params: { id: homebrew.id, provider: 'daggerheart', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        let(:request) {
          delete :destroy, params: { id: homebrew.id, provider: 'daggerheart', charkeeper_access_token: access_token }
        }

        before { homebrew.update!(user: user_session.user) }

        it 'deletes homebrew', :aggregate_failures do
          expect { request }.to change(Daggerheart::Homebrew::Community, :count).by(-1)
          expect(response).to have_http_status :ok
          expect(response.parsed_body).to eq({ 'result' => 'ok' })
        end

        context 'when character exists with deleting ancestry' do
          let!(:character) { create :character, :daggerheart, user: user_session.user }

          before do
            character.data['community'] = homebrew.id
            character.save
          end

          it 'returns error', :aggregate_failures do
            expect { request }.not_to change(Daggerheart::Homebrew::Community, :count)
            expect(response).to have_http_status :unprocessable_content
            expect(response.parsed_body['errors']).to eq({ 'base' => ['Персонаж с таким обществом существует'] })
          end
        end
      end
    end
  end
end
