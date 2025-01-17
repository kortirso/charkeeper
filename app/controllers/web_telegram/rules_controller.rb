# frozen_string_literal: true

module WebTelegram
  class RulesController < WebTelegram::BaseController
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
