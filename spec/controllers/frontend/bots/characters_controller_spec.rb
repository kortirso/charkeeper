# frozen_string_literal: true

describe Frontend::Bots::CharactersController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'POST#create' do
    let!(:character) { create :character, user: user_session.user }

    context 'for logged users' do
      context 'without character' do
        let(:request) { post :create, params: { values: ['/roll d20'], id: 'unexisting', charkeeper_access_token: access_token } }

        context 'for invalid command' do
          it 'returns errors messages', :aggregate_failures do
            request

            expect(response).to have_http_status :not_found
          end
        end
      end

      context 'with character' do
        let(:request) { post :create, params: { values: values, id: character.id, charkeeper_access_token: access_token } }

        context 'for /roll' do
          context 'for invalid command' do
            let(:values) { ['/rolld 20'] }

            it 'returns errors messages', :aggregate_failures do
              request

              expect(response.parsed_body.dig(:result, 0, :errors)).to eq(['Invalid command'])
              expect(response).to have_http_status :ok
            end
          end

          context 'for valid params' do
            let(:values) { ['/roll d20'] }

            before { allow(BotContext::Channels::SendToTelegramJob).to receive(:perform_later) }

            it 'returns result', :aggregate_failures do
              request

              expect(response.parsed_body[:errors]).to be_nil
              expect(response).to have_http_status :ok
              expect(BotContext::Channels::SendToTelegramJob).not_to have_received(:perform_later)
            end

            context 'when channel is present' do
              let!(:campaign) { create :campaign, provider: 'dnd5' }

              before do
                create :campaign_character, campaign: campaign, character: character
                create :channel, campaign: campaign
              end

              it 'returns result', :aggregate_failures do
                request

                expect(response.parsed_body[:errors]).to be_nil
                expect(response).to have_http_status :ok
                expect(BotContext::Channels::SendToTelegramJob).to have_received(:perform_later)
              end
            end
          end
        end

        context 'for /dualityRoll' do
          context 'for invalid command' do
            let(:values) { ['/dualityROll d12 d12'] }

            it 'returns errors messages', :aggregate_failures do
              request

              expect(response.parsed_body.dig(:result, 0, :errors)).to eq(['Invalid command'])
              expect(response).to have_http_status :ok
            end
          end

          context 'for valid params' do
            let(:values) { ['/dualityRoll d12 d12'] }

            it 'returns result', :aggregate_failures do
              request

              expect(response.parsed_body[:errors]).to be_nil
              expect(response).to have_http_status :ok
            end
          end
        end

        context 'for /fateRoll' do
          context 'for invalid command' do
            let(:values) { ['/fateROll 1'] }

            it 'returns errors messages', :aggregate_failures do
              request

              expect(response.parsed_body.dig(:result, 0, :errors)).to eq(['Invalid command'])
              expect(response).to have_http_status :ok
            end
          end

          context 'for valid params' do
            let(:values) { ['/fateRoll'] }

            it 'returns result', :aggregate_failures do
              request

              expect(response.parsed_body[:errors]).to be_nil
              expect(response).to have_http_status :ok
            end
          end
        end

        context 'for dnd checks' do
          %w[save attr skill attack initiative].each do |attr|
            let(:values) { ["/check #{attr} athletics --bonus 1"] }

            it 'returns result', :aggregate_failures do
              request

              expect(response.parsed_body.dig(:result, 0, :result).keys).to(
                contain_exactly('rolls', 'total', 'final_roll', 'status')
              )
              expect(response.parsed_body[:errors]).to be_nil
              expect(response).to have_http_status :ok
            end
          end
        end

        context 'for daggerheart checks' do
          let!(:character) { create :character, :daggerheart, user: user_session.user }

          %w[attr attack].each do |attr|
            let(:values) { ["/check #{attr} presence --bonus 1"] }

            it 'returns result', :aggregate_failures do
              request

              expect(response.parsed_body.dig(:result, 0, :result).keys).to(
                contain_exactly('rolls', 'total', 'status')
              )
              expect(response.parsed_body[:errors]).to be_nil
              expect(response).to have_http_status :ok
            end
          end
        end

        context 'for pathfinder2 checks' do
          let!(:character) { create :character, :pathfinder2, user: user_session.user }

          %w[save attr skill attack initiative].each do |attr|
            let(:values) { ["/check #{attr} will --bonus 1"] }

            it 'returns result', :aggregate_failures do
              request

              expect(response.parsed_body.dig(:result, 0, :result).keys).to(
                contain_exactly('rolls', 'total', 'final_roll', 'status')
              )
              expect(response.parsed_body[:errors]).to be_nil
              expect(response).to have_http_status :ok
            end
          end
        end

        context 'for fate checks' do
          let!(:character) { create :character, :fate, user: user_session.user }

          %w[skill stunt].each do |attr|
            let(:values) { ["/check #{attr} will --bonus 1"] }

            it 'returns result', :aggregate_failures do
              request

              expect(response.parsed_body.dig(:result, 0, :result).keys).to(
                contain_exactly('rolls', 'total')
              )
              expect(response.parsed_body[:errors]).to be_nil
              expect(response).to have_http_status :ok
            end
          end
        end

        context 'for dc20 checks' do
          let!(:character) { create :character, :dc20, user: user_session.user }

          %w[attr save skill trade language initiative attack].each do |attr|
            let(:values) { ["/check #{attr} empty --bonus 2"] }

            it 'returns result', :aggregate_failures do
              request

              expect(response.parsed_body.dig(:result, 0, :result).keys).to(
                contain_exactly('rolls', 'total', 'final_roll', 'status')
              )
              expect(response.parsed_body[:errors]).to be_nil
              expect(response).to have_http_status :ok
            end
          end
        end
      end
    end
  end
end
