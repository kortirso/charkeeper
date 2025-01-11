# frozen_string_literal: true

module SerializeRelation
  extend ActiveSupport::Concern

  private

  def serialize_relation(relation, serializer, key)
    Panko::Response.new(key => Panko::ArraySerializer.new(relation, each_serializer: serializer))
  end
end
