# frozen_string_literal: true

module ChannelsContext
  class AddChannelCommand < BaseCommand
    use_contract do
      config.messages.namespace = :channel

      Providers = Dry::Types['strict.string'].enum(*Channel.providers.keys)

      params do
        required(:provider).filled(Providers)
        optional(:external_id).filled(:string)
      end
    end

    private

    def do_persist(input)
      result = Channel.find_or_create_by!(input)

      { result: result }
    end
  end
end
