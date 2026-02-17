# frozen_string_literal: true

module ApplicationCable
  class Channel < ActionCable::Channel::Base
    class << self
      def broadcast_to(model, message={})
        super
      rescue StandardError => e
        Charkeeper::Container.resolve('monitoring.client').notify(
          exception: Monitoring::ChannelSendError.new('Channel broadcast error'),
          metadata: {
            message: message,
            details: e.message
          },
          severity: :error
        )
      end
    end

    def subscribed; end
  end
end
