# frozen_string_literal: true

require 'dry/auto_inject'
require 'dry/container'

module Characters
  class Container
    extend Dry::Container::Mixin

    DEFAULT_OPTIONS = { memoize: true }.freeze

    class << self
      def register(key)
        super(key, DEFAULT_OPTIONS)
      end
    end

    # commands
    register('commands.auth_context.add_identity') { AuthContext::AddIdentityCommand.new }

    # services
    register('services.auth_context.validate_web_telegram_signature') { AuthContext::WebTelegramSignatureValidateService.new }
  end
end

Deps = Dry::AutoInject(Characters::Container)
