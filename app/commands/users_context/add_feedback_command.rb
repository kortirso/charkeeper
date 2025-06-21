# frozen_string_literal: true

module UsersContext
  class AddFeedbackCommand < BaseCommand
    use_contract do
      config.messages.namespace = :user

      params do
        required(:user).filled(type?: ::User)
        required(:value).filled(:string)
      end
    end

    private

    def do_persist(input)
      result = User::Feedback.create!(input)

      { result: result }
    end
  end
end
