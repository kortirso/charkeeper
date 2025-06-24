# frozen_string_literal: true

module UsersContext
  class UpdateCommand < BaseCommand
    use_contract do
      config.messages.namespace = :user

      Locales = Dry::Types['strict.string'].enum(*I18n.available_locales.map(&:to_s))

      params do
        required(:user).filled(type?: ::User)
        optional(:locale).filled(Locales)
        optional(:username).filled(:string)
      end

      rule(:username) do
        next if value.blank?

        key.failure(:invalid) if !/[\w+\-\_]+/i.match?(value) || User.exists?(username: value)
      end
    end

    private

    def do_persist(input)
      input[:user].update!(input.except(:user))

      { result: input[:user].reload }
    end
  end
end
