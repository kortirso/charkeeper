# frozen_string_literal: true

module AuthContext
  class AddUserCommand < BaseCommand
    use_contract do
      config.messages.namespace = :user

      params do
        required(:username).filled(:string)
        required(:password).filled(:string)
        required(:password_confirmation).filled(:string)
        optional(:locale).maybe(:string)
      end

      rule(:username) do
        if value && !/[\w+\-\_]+/i.match?(value)
          key.failure(:invalid)
        end
      end

      rule(:password, :password_confirmation) do
        key(:passwords).failure(:different) if values[:password] != values[:password_confirmation]
      end

      rule(:password) do
        if values[:password].size < 10
          key.failure(I18n.t('dry_schema.errors.user.password_length', length: 10))
        end
      end
    end

    private

    def do_prepare(input)
      input[:locale] = I18n.locale if input[:locale].blank?
      input[:color_schema] = User::DARK

      input[:book_attributes] = Homebrew::Book.where(shared: true).map do |book|
        {
          homebrew_book_id: book.id
        }
      end
    end

    def do_persist(input)
      result = User.create!(input.except(:book_attributes))

      if input[:book_attributes].any?
        User::Book.upsert_all(input[:book_attributes].map { |attrs| attrs.merge(user_id: result.id) })
      end

      { result: result }
    rescue ActiveRecord::RecordNotUnique => _e
      { errors: { username: [I18n.t('dry_schema.errors.user.exists')] }, errors_list: [I18n.t('dry_schema.errors.user.exists')] }
    end
  end
end
