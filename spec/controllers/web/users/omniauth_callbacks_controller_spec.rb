# frozen_string_literal: true

describe Web::Users::OmniauthCallbacksController do
  let(:configuration) { Authkeeper::Configuration.new }

  before do
    allow(Authkeeper).to receive_messages(configuration: configuration)

    configuration.omniauth_providers = %w[telegram]
    configuration.access_token_name = :charkeeper_access_token
  end

  describe 'POST#create' do
    let(:code) { nil }
    let(:request) { post :create, params: { provider: provider, code: code } }

    context 'for unexisting provider' do
      let(:provider) { 'unknown' }

      it 'redirects to root path', :aggregate_failures do
        expect { request }.not_to change(User, :count)
        expect(response).to redirect_to root_path
      end
    end

    context 'for telegram' do
      let(:request) { post :create, params: { provider: provider, id: id } }
      let(:id) { nil }
      let(:provider) { 'telegram' }

      context 'for blank id' do
        it 'redirects to login path', :aggregate_failures do
          expect { request }.not_to change(User, :count)
          expect(response).to redirect_to root_path
        end
      end

      context 'for present id' do
        let(:id) { 'id' }

        before do
          allow(Authkeeper::Container.resolve('services.providers.telegram')).to(
            receive(:call).and_return(telegram_auth_result)
          )
        end

        context 'for invalid id' do
          let(:telegram_auth_result) { { result: nil } }

          it 'redirects to login path', :aggregate_failures do
            expect { request }.not_to change(User, :count)
            expect(response).to redirect_to root_path
          end
        end

        context 'for valid id' do
          let(:telegram_auth_result) { { result: auth_payload } }

          context 'for not logged user' do
            context 'for valid payload' do
              let(:auth_payload) do
                {
                  uid: '123',
                  provider: 'telegram',
                  login: 'octocat'
                }
              end

              it 'redirects to dashboard_path', :aggregate_failures do
                expect { request }.to change(User, :count)
                expect(response).to redirect_to dashboard_path
              end
            end
          end

          context 'for logged user' do
            sign_in_user

            context 'for valid payload' do
              let(:auth_payload) do
                {
                  uid: '123',
                  provider: 'telegram',
                  login: 'octocat'
                }
              end

              it 'redirects to dashboard_path', :aggregate_failures do
                expect { request }.to change(User::Identity, :count).by(1)
                expect(response).to redirect_to dashboard_path
              end

              context 'when identity belongs to another user' do
                let!(:identity) { create :user_identity, uid: '123' }

                it 'redirects to dashboard_path', :aggregate_failures do
                  expect { request }.not_to change(User::Identity, :count)
                  expect(identity.reload.user).to eq @current_user
                  expect(response).to redirect_to dashboard_path
                end
              end
            end
          end
        end
      end
    end
  end
end
