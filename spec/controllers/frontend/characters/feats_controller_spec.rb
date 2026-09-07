# frozen_string_literal: true

describe Frontend::Characters::FeatsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  let!(:character) { create :pathfinder2_character }
  let!(:user_character) { create :pathfinder2_character, user: user_session.user }

  describe 'POST#create' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          post :create, params: {
            character_id: 'unexisting', feat: {
              title: { en: 'title' }, description: { en: 'value' }
            }, charkeeper_access_token: access_token, provider: 'pathfinder2'
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          post :create, params: {
            character_id: character.id, feat: {
              title: { en: 'title' }, description: { en: 'value' }
            }, charkeeper_access_token: access_token, provider: 'pathfinder2'
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'for invalid request' do
          let(:request) {
            post :create, params: {
              character_id: user_character.id, feat: {
                title: { en: 'title' }, description: { en: '' }
              }, charkeeper_access_token: access_token, provider: 'pathfinder2'
            }
          }

          it 'does not create feat', :aggregate_failures do
            expect { request }.not_to change(Feat.where(origin_value: user_character.id), :count)
            expect(response).to have_http_status :unprocessable_content
          end
        end

        context 'for valid request' do
          let(:request) {
            post :create, params: {
              character_id: user_character.id, feat: {
                title: { en: 'title' }, description: { en: 'value' }
              }, charkeeper_access_token: access_token, provider: 'pathfinder2'
            }
          }

          it 'creates character feat', :aggregate_failures do
            expect { request }.to(
              change(user_character.feats, :count).by(1)
                .and(change(Feat.where(origin_value: user_character.id), :count).by(1))
            )
            expect(response).to have_http_status :created
            expect(response.parsed_body['feat'].keys).to contain_exactly('id', 'title', 'description', 'raw', 'origin_value')
          end
        end
      end
    end
  end
end
