# frozen_string_literal: true

describe BotContext::Commands::Character do
  subject(:service_call) do
    I18n.with_locale(:en) do
      described_class.new.call(source: source, arguments: arguments, data: { raw_message: message, user: user })
    end
  end

  let(:source) { :telegram_bot }
  let(:arguments) { [] }
  let(:message) do
    {
      message_id: 1,
      from: { language_code: 'en' },
      chat: { id: 1 },
      text: text
    }
  end
  let(:text) { '/character list' }
  let(:user) { create :user }

  context 'when user is nil' do
    let(:user) { nil }

    it 'returns nil' do
      expect(service_call).to be_nil
    end
  end

  context 'when arguments is not match' do
    it 'returns nil' do
      expect(service_call).to be_nil
    end
  end

  context 'for list command' do
    let(:text) { '/character list' }
    let(:arguments) { %w[list] }

    it 'returns empty list' do
      expect(service_call[:result]).to be_blank
    end

    context 'with existing character' do
      before { create :character, :daggerheart, user: user }

      it 'returns list' do
        expect(service_call[:result]).not_to be_blank
      end
    end
  end

  context 'for joinCampaign command' do
    let!(:character) { create :character, :daggerheart, user: user, name: 'Characterio' }
    let(:source) { :web }
    let(:text) { "/character joinCampaign #{character.name}" }
    let(:arguments) { ['joinCampaign', character.name] }

    it 'returns nil' do
      expect(service_call).to be_nil
    end

    context 'with unexisting character' do
      let(:arguments) { ['joinCampaign', 'char name'] }

      it 'returns nil' do
        expect(service_call).to be_nil
      end
    end

    context 'for telegram' do
      let!(:campaign) { create :campaign, :daggerheart, user: user, name: 'TheEnd' }
      let!(:channel) { create :channel, external_id: '1' }
      let(:source) { :telegram_bot }

      context 'without campaign' do
        it 'does not attach character to campaign' do
          expect { service_call }.not_to change(Campaign::Character, :count)
        end
      end

      context 'with existing campaign' do
        before { create :campaign_channel, campaign: campaign, channel: channel }

        it 'attaches character to campaign' do
          expect { service_call }.to change(Campaign::Character, :count).by(1)
        end

        context 'with unmatched providers' do
          before { campaign.update!(provider: 'dc20') }

          it 'does not attach character to campaign' do
            expect { service_call }.not_to change(Campaign::Character, :count)
          end
        end
      end
    end
  end
end
