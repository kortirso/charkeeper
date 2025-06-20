# frozen_string_literal: true

describe Frontend::Dnd2024::Characters::RestController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:character) { create :character, :dnd2024 }
  let!(:user_character) { create :character, :dnd2024, user: user_session.user }
  let(:service) { Charkeeper::Container.resolve('commands.characters_context.dnd2024.make_short_rest') }

  before { allow(service).to receive(:call) }

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
        context 'for unexisting type' do
          it 'returns error' do
            post :create, params: {
              character_id: user_character.id, type: 'unexisting', charkeeper_access_token: access_token
            }

            expect(response).to have_http_status :unprocessable_entity
          end
        end

        context 'for existing type' do
          let(:request) {
            post :create, params: { character_id: user_character.id, type: 'short_rest', charkeeper_access_token: access_token }
          }

          it 'calls service', :aggregate_failures do
            request

            expect(service).to have_received(:call)
            expect(response).to have_http_status :ok
            expect(response.parsed_body).to eq({ 'result' => 'ok' })
          end
        end
      end
    end
  end
end
