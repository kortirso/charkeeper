# frozen_string_literal: true

describe Frontend::Cosmere::Characters::RestController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:character) { create :character, :cosmere }
  let!(:user_character) { create :character, :cosmere, user: user_session.user }

  describe 'POST#create' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          post :create, params: { character_id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          post :create, params: { character_id: character.id, charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'for unexisting value' do
          it 'returns error' do
            post :create, params: {
              character_id: user_character.id, rest: { value: 'unexisting' }, charkeeper_access_token: access_token
            }

            expect(response).to have_http_status :unprocessable_content
          end
        end

        context 'for short rest' do
          let(:request) {
            post :create, params: {
              character_id: user_character.id, rest: { value: 'short' }, charkeeper_access_token: access_token
            }
          }

          it 'refreshes character', :aggregate_failures do
            request

            expect(response).to have_http_status :ok
            expect(response.parsed_body[:recovery]).to be_nil
          end

          context 'with recovery' do
            let(:request) {
              post :create, params: {
                character_id: user_character.id, rest: {
                  value: 'short', make_rolls: true, recovery_die: 12
                }, charkeeper_access_token: access_token
              }
            }

            it 'refreshes character', :aggregate_failures do
              request

              expect(response).to have_http_status :ok
              expect(response.parsed_body[:recovery]).not_to be_nil
            end
          end
        end

        context 'for long rest' do
          let(:request) {
            post :create, params: {
              character_id: user_character.id, rest: {
                value: 'long', health_max: 16, focus_max: 4
              }, charkeeper_access_token: access_token
            }
          }

          before do
            user_character.data[:health] = 4
            user_character.data[:focus] = 2
            user_character.save
          end

          it 'refreshes character', :aggregate_failures do
            request

            expect(response).to have_http_status :ok
            expect(response.parsed_body[:recovery]).to be_nil
            expect(user_character.reload.data.health).to eq 16
            expect(user_character.data.focus).to eq 4
          end
        end
      end
    end
  end
end
