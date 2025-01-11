# frozen_string_literal: true

module Api
  module V1
    class RulesController < Api::V1::BaseController
      include SerializeRelation

      def index
        render json: serialize_relation(rules, RuleSerializer, :rules), status: :ok
      end

      private

      def rules
        Rule.all
      end
    end
  end
end
