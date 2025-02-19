# frozen_string_literal: true

module UsersContext
  class UpdateCommand < BaseCommand
    use_contract do
      config.messages.namespace = :user

      Locales = Dry::Types['strict.string'].enum(*I18n.available_locales.map(&:to_s))

      params do
        required(:user).filled(type?: ::User)
        optional(:locale).filled(Locales)
      end
    end

    private

    def do_persist(input)
      input[:user].update!(input.except(:user))

      { result: input[:user].reload }
    end
  end
end
