# frozen_string_literal: true

module Frontend
  module Users
    class FeedbacksController < Frontend::BaseController
      include Deps[
        add_feedback: 'commands.users_context.add_feedback'
      ]

      def create
        case add_feedback.call(feedback_params.merge(user: current_user))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        else only_head_response
        end
      end

      private

      def feedback_params
        params.require(:feedback).permit!.to_h
      end
    end
  end
end
