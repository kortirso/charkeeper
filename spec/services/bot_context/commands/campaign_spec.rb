# frozen_string_literal: true

describe BotContext::Commands::Campaign do
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
  let(:text) { '/campaign list' }
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

  context 'for create command' do
    let(:text) { '/campaign create --system dnd5 --name TheEnd' }
    let(:arguments) { %w[create --system dnd5 --name TheEnd] }

    it 'creates channel and campaign' do
      expect { service_call }.to(
        change(Channel, :count).by(1)
        .and(change(Campaign, :count).by(1))
      )
    end

    context 'with existing channel' do
      let!(:channel) { create :channel, external_id: '1' }

      it 'creates campaign and attaches to channel', :aggregate_failures do
        expect { service_call }.to change(Campaign, :count).by(1)
        expect(channel.campaign).to eq Campaign.last
      end

      context 'with existing campaign' do
        before do
          campaign = create :campaign, :daggerheart
          create :campaign_channel, campaign: campaign, channel: channel
        end

        it 'creates campaign and does not attach to channel', :aggregate_failures do
          expect { service_call }.to change(Campaign, :count).by(1)
          expect(channel.campaign).not_to eq Campaign.last
        end
      end
    end
  end

  context 'for list command' do
    let(:text) { '/campaign list' }
    let(:arguments) { %w[list] }

    it 'returns empty list' do
      expect(service_call[:result]).to be_blank
    end

    context 'with existing campaign' do
      before { create :campaign, :daggerheart, user: user }

      it 'returns list' do
        expect(service_call[:result]).not_to be_blank
      end
    end
  end

  context 'for remove command' do
    let(:text) { '/campaign remove TheEnd' }
    let(:arguments) { %w[remove TheEnd] }

    it 'does not remove campaign' do
      expect { service_call }.to raise_error(ActiveRecord::RecordNotFound)
    end

    context 'with existing campaign' do
      before { create :campaign, :daggerheart, user: user, name: 'TheEnd' }

      it 'removes campaign' do
        expect { service_call }.to change(Campaign, :count).by(-1)
      end
    end
  end

  context 'for show command' do
    let(:source) { :web }
    let(:text) { '/campaign show' }
    let(:arguments) { %w[show] }

    it 'returns nil' do
      expect(service_call).to be_nil
    end

    context 'for telegram' do
      let!(:campaign) { create :campaign, :daggerheart, user: user, name: 'TheEnd' }
      let(:source) { :telegram_bot }

      it 'returns channel campaign', :aggregate_failures do
        expect { service_call }.to change(Channel, :count).by(1)
        expect(Channel.last.campaign).to be_nil
      end

      context 'with existing channel' do
        let!(:channel) { create :channel, external_id: '1' }

        it 'returns channel campaign', :aggregate_failures do
          expect { service_call }.not_to change(Channel, :count)
          expect(channel.campaign).to be_nil
        end

        context 'with existing campaign' do
          let!(:campaign) { create :campaign, :daggerheart }

          before { create :campaign_channel, campaign: campaign, channel: channel }

          it 'returns channel campaign', :aggregate_failures do
            expect { service_call }.not_to change(Campaign::Channel, :count)
            expect(channel.campaign).to eq campaign
          end
        end
      end
    end
  end

  context 'for set command' do
    let(:source) { :web }
    let(:text) { '/campaign set TheEnd' }
    let(:arguments) { %w[set TheEnd] }

    it 'returns nil' do
      expect(service_call).to be_nil
    end

    context 'for telegram' do
      let!(:campaign) { create :campaign, :daggerheart, user: user, name: 'TheEnd' }
      let(:source) { :telegram_bot }

      it 'creates channel and attaches campaign', :aggregate_failures do
        expect { service_call }.to change(Channel, :count).by(1)
        expect(Channel.last.campaign).to eq campaign
      end

      context 'with existing channel' do
        let!(:channel) { create :channel, external_id: '1' }

        it 'attaches campaign to channel', :aggregate_failures do
          expect { service_call }.not_to change(Channel, :count)
          expect(channel.campaign).to eq campaign
        end

        context 'with existing campaign' do
          before do
            campaign = create :campaign, :daggerheart
            create :campaign_channel, campaign: campaign, channel: channel
          end

          it 'does not attach campaign to channel' do
            expect { service_call }.not_to change(Campaign::Channel, :count)
          end
        end
      end
    end
  end
end
