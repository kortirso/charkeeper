# frozen_string_literal: true

module UsersContext
  class UpdateCommand < BaseCommand
    use_contract do
      config.messages.namespace = :user

      Locales = Dry::Types['strict.string'].enum(*I18n.available_locales.map(&:to_s))
      ColorSchemas = Dry::Types['strict.string'].enum(*User.color_schemas.keys)

      params do
        required(:user).filled(type?: ::User)
        optional(:locale).filled(Locales)
        optional(:username).filled(:string)
        optional(:color_schema).filled(ColorSchemas)
        optional(:password).filled(:string, min_size?: 10)
        optional(:password_confirmation).filled(:string, min_size?: 10)
      end

      rule(:password, :password_confirmation).validate(:check_all_or_nothing_present)
      rule(:password, :password_confirmation) do
        next if values[:password] == values[:password_confirmation]

        key(:passwords).failure(:different)
      end
      rule(:username) do
        next if value.blank?

        key.failure(:invalid) if !/[\w+\-\_]+/i.match?(value) || User.exists?(username: value)
      end
    end

    private

    def do_persist(input)
      input[:user].update!(input.except(:user))

      { result: input[:user] }
    end
  end
end
