# frozen_string_literal: true

describe BotContext::HandleService do
  subject(:service_call) do
    I18n.with_locale(:en) do
      described_class.new.call(source: source, message: text, data: {
        raw_message: message,
        user: user,
        character: command_character
      })
    end
  end

  let!(:user) { create :user }
  let(:command_character) { nil }
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

  before { allow(client).to receive(:send_message) }

  context 'for existing bot command' do
    let(:source) { :telegram_group_bot }

    it 'sends response message' do
      service_call

      expect(client).to have_received(:send_message)
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

    context 'for check commands' do
      let!(:channel) { create :channel, external_id: '1' }

      context 'for dnd' do
        let!(:campaign) { create :campaign, :dnd5 }
        let!(:character) { create :character }
        let(:command_character) { Dnd5::Character.find_by(id: character&.id) }

        context 'when campaign attached to channel' do
          let(:source) { :raw }
          let(:text) { '/check attr str' }

          before do
            create :campaign_character, campaign: campaign, character: character
            create :campaign_channel, campaign: campaign, channel: channel
          end

          it 'sends message' do
            service_call

            expect(client).to have_received(:send_message)
          end
        end
      end

      context 'for daggerheart' do
        let!(:campaign) { create :campaign, :daggerheart }
        let!(:character) { create :character, :daggerheart }
        let(:command_character) { Daggerheart::Character.find_by(id: character&.id) }

        context 'when campaign attached to channel' do
          let(:source) { :raw }
          let(:text) { '/check attr str' }

          before do
            create :campaign_character, campaign: campaign, character: character
            create :campaign_channel, campaign: campaign, channel: channel
          end

          it 'sends message' do
            service_call

            expect(client).to have_received(:send_message)
          end
        end
      end
    end
  end

  context 'for web request' do
    let(:source) { :web }

    it 'sends response message', :aggregate_failures do
      expect(service_call[:result].include?('Rolls: d20')).to be_truthy
      expect(client).not_to have_received(:send_message)
    end

    context 'for digital request' do
      let(:text) { '/roll 20' }

      it 'sends response message', :aggregate_failures do
        expect(service_call[:result].include?('Rolls: 20')).to be_truthy
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
  end
end
