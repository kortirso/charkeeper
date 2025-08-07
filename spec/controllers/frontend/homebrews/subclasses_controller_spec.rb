# frozen_string_literal: true

describe Frontend::Homebrews::SubclassesController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'POST#create' do
    context 'for logged users' do
      let(:request) {
        post :create, params: {
          brewery: { name: name, class_name: 'id', spellcast: 'pre' },
          provider: 'daggerheart',
          charkeeper_access_token: access_token
        }
      }

      context 'for invalid params' do
        let(:name) { '' }

        it 'does not create homebrew', :aggregate_failures do
          expect { request }.not_to change(Daggerheart::Homebrew::Subclass, :count)
          expect(response).to have_http_status :unprocessable_entity
        end
      end

      context 'for valid params' do
        let(:name) { 'Moon' }

        it 'creates homebrew', :aggregate_failures do
          expect { request }.to change(Daggerheart::Homebrew::Subclass, :count).by(1)
          expect(response).to have_http_status :created
        end
      end
    end
  end

  describe 'DELETE#destroy' do
    context 'for logged users' do
      let!(:homebrew) { create :homebrew_subclass, :daggerheart }

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
          expect { request }.to change(Daggerheart::Homebrew::Subclass, :count).by(-1)
          expect(response).to have_http_status :ok
          expect(response.parsed_body).to eq({ 'result' => 'ok' })
        end
      end
    end
  end
end
