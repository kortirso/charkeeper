# frozen_string_literal: true

describe BotContext::HandleService do
  subject(:service_call) do
    I18n.with_locale(:en) do
      described_class.new.call(source: source, message: text, data: { raw_message: message, user: user })
    end
  end

  let!(:user) { create :user }
  let(:message) do
    {
      message_id: 1,
      from: { language_code: 'en' },
      chat: { id: 1 },
      text: text
    }
  end
  let(:text) { '/roll d20' }
  let(:client) { Charkeeper::Container.resolve('api.telegram.client') }

  before do
    allow(client).to receive(:send_message)
  end

  context 'for existing bot command' do
    let(:source) { :telegram_group_bot }

    it 'sends response message' do
      service_call

      expect(client).to have_received(:send_message)
    end

    context 'for module commands' do
      before { create :homebrew_book, user: user }

      context 'when list' do
        let(:text) { '/module list' }

        it 'sends list of modules' do
          service_call

          expect(client).to have_received(:send_message).with(
            bot_secret: nil,
            chat_id: 1,
            reply_to_message_id: 1,
            text: 'Daggerheart - Book'
          )
        end
      end
    end

    context 'for campaign commands' do
      let!(:channel) { create :channel, external_id: '1' }
      let!(:campaign) { create :campaign, :daggerheart }
      let!(:character1) { create :character, :daggerheart }
      let!(:character2) { create :character, :daggerheart }

      before do
        create :campaign_character, campaign: campaign, character: character1
        create :campaign_character, campaign: campaign, character: character2
        create :campaign_channel, campaign: campaign, channel: channel
      end

      context 'when show' do
        let(:text) { '/campaign show' }

        it 'shows campaign info' do
          service_call

          expect(client).to have_received(:send_message).with(
            bot_secret: nil,
            chat_id: 1,
            reply_to_message_id: 1,
            text: "Daggerheart - #{campaign.name}\n\nCampaign' characters\n\n#{character1.name}\n\n#{character2.name}"
          )
        end
      end
    end
  end

  context 'for web request' do
    let(:source) { :web }

    it 'sends response message', :aggregate_failures do
      expect(service_call[:result].include?('Result: d20')).to be_truthy
      expect(client).not_to have_received(:send_message)
    end

    context 'for digital request' do
      let(:text) { '/roll 20' }

      it 'sends response message', :aggregate_failures do
        expect(service_call[:result].include?('Result: 20')).to be_truthy
        expect(client).not_to have_received(:send_message)
      end
    end

    context 'for unexisting command' do
      let(:text) { '/rolld d20' }

      it 'sends error', :aggregate_failures do
        expect(service_call[:errors].include?('Invalid command')).to be_truthy
        expect(client).not_to have_received(:send_message)
      end
    end

    context 'for argument error' do
      let(:text) { '/module create d20' }

      it 'sends error', :aggregate_failures do
        expect(service_call[:errors].include?('Invalid command')).to be_truthy
        expect(client).not_to have_received(:send_message)
      end
    end

    context 'for service command' do
      let(:text) { '/start' }

      it 'does not send response message', :aggregate_failures do
        expect(service_call[:result]).to eq :ok
        expect(client).not_to have_received(:send_message)
      end
    end

    context 'for module commands' do
      let!(:book) { create :homebrew_book, user: user }

      context 'when list' do
        let(:text) { '/module list' }

        it 'returns list of modules' do
          expect(service_call[:result]).to eq 'Daggerheart - Book'
        end
      end

      context 'when show' do
        let(:text) { '/module show' }

        context 'without active book' do
          it 'returns error', :aggregate_failures do
            expect(service_call[:result]).to be_nil
            expect(service_call[:errors_list]).to eq(['Object is not found'])
          end
        end

        context 'with active book' do
          before { create :active_bot_object, user: user, info: { id: book.id } }

          it 'returns list of modules' do
            expect(service_call[:result]).to eq 'Daggerheart - Book'
          end
        end

        context 'with unexisting active book' do
          before { create :active_bot_object, user: user, info: { id: 'unexisting' } }

          it 'returns error', :aggregate_failures do
            expect(service_call[:result]).to be_nil
            expect(service_call[:errors_list]).to eq(['Object is not found'])
          end
        end
      end

      context 'when set' do
        context 'without active book' do
          let(:text) { "/module set #{book.name}" }

          it 'sets active book' do
            expect { service_call }.to change(ActiveBotObject, :count).by(1)
          end
        end

        context 'for unexisting name' do
          let(:text) { '/module set name' }

          it 'returns error', :aggregate_failures do
            expect { service_call }.not_to change(ActiveBotObject, :count)
            expect(service_call[:result]).to be_nil
            expect(service_call[:errors_list]).to eq(['Object is not found'])
          end
        end
      end

      context 'when export' do
        let(:text) { '/module export' }

        context 'without active book' do
          it 'returns error', :aggregate_failures do
            expect(service_call[:result]).to be_nil
            expect(service_call[:errors_list]).to eq(['Object is not found'])
          end
        end

        context 'with active book' do
          before { create :active_bot_object, user: user, info: { id: book.id } }

          it 'returns import command' do
            expect(service_call[:result].include?("/module import #{book.id}")).to be_truthy
          end
        end
      end
    end
  end
end
